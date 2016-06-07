import d2 from 'd2/lib/d2';
import compose from 'lodash/fp/compose';
import map from 'lodash/fp/map';
import headerBarSettingsStore$ from './settings/settings.store';
import { profileSource$, appsMenuSource$ } from './menu-sources';
import curry from 'lodash/fp/curry';
import pickLodash from 'lodash/fp/pick';
import getLodash from 'lodash/fp/get';
import { Observable } from 'rx';

const pick = curry(pickLodash);
const pluck = curry(getLodash);

const translate = curry(function translate(d2, key) {
    return d2.i18n.getTranslation(key);
});

const d2Offline = { currentUser: { userSettings: {} } };
const d2$ = Observable.fromPromise(d2.getInstance()).catch(Observable.just(d2Offline));
const currentUser$ = d2$.map(pluck('currentUser'));

export const translate$ = Observable
    .combineLatest(
        d2$,
        Observable.just(translate),
        (d2, translateFn) => translateFn(d2)
    );

export function translateMenuItemNames(translate, items) {
    return items.map((item) => Object.assign({}, item, { name: translate(item.name) }));
}

const removePrefix = (word) => word.replace(/^\.\./, '');
const isAbsoluteUrl = (url) => /^(?:https?:)?\/\//.test(url);
export const getBaseUrlFromD2 = (d2) => d2.Api.getApi().baseUrl.replace('/api', '');

const addBaseUrlWhenNotAnAbsoluteUrl = curry((baseUrl, url) => isAbsoluteUrl(url) ? url : baseUrl + removePrefix(url));
const getIconUrl = item => item.icon || '/icons/program.png';
const adjustIconUrl = curry((baseUrl, item) => Object.assign({}, item, { icon: addBaseUrlWhenNotAnAbsoluteUrl(baseUrl, getIconUrl(item)) }));
const adjustDefaultActionUrl = curry((baseUrl, item) => Object.assign({}, item, { action: addBaseUrlWhenNotAnAbsoluteUrl(baseUrl, item.defaultAction) }));
const adjustMenuItemsUrls = (baseUrl) => compose(adjustIconUrl(baseUrl), adjustDefaultActionUrl(baseUrl));
const getLabelFromName = (item) => Object.assign({}, item, { label: item.displayName || item.name });
const extractMenuProps = pick(['action', 'icon', 'description', 'label']);
const prepareMenuItem = (baseUrl) => compose(extractMenuProps, adjustMenuItemsUrls(baseUrl), getLabelFromName);
export const prepareMenuItems = (baseUrl, items) => map(prepareMenuItem(baseUrl), items);

const profileMenuItems$ = Observable
    .combineLatest(translate$, profileSource$, translateMenuItemNames)
    .combineLatest(d2$, (items, d2) => ({items, d2}))
    .map(({items, d2}) => prepareMenuItems(getBaseUrlFromD2(d2), items))
    .catch(Observable.just([]));

const appsMenuItems$ = appsMenuSource$
    .combineLatest(d2$, (items, d2) => ({items, d2}))
    .map(({items, d2}) => prepareMenuItems(getBaseUrlFromD2(d2), items))
    .catch(Observable.just([]));

const headerBarStore$ = Observable
    .combineLatest(
        appsMenuItems$,
        profileMenuItems$,
        currentUser$,
        headerBarSettingsStore$,
        (appItems, profileItems, currentUser, settings) => ({appItems, profileItems, currentUser, settings})
    );

export default headerBarStore$;
