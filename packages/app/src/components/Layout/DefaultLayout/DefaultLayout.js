import React from 'react';

import DefaultAxis from './DefaultAxis';
import styles from './styles/DefaultLayout.style';

const Layout = () => (
    <div id="layout-ct" style={styles.ct}>
        <div
            id="axis-group-1"
            style={{ ...styles.axisGroup, ...styles.axisGroupLeft }}
        >
            <DefaultAxis axisName="columns" style={styles.columns} />
            <DefaultAxis axisName="rows" style={styles.rows} />
        </div>
        <div
            id="axis-group-2"
            style={{ ...styles.axisGroup, ...styles.axisGroupRight }}
        >
            <DefaultAxis axisName="filters" style={styles.filters} />
        </div>
    </div>
);

Layout.displayName = 'Layout';

export default Layout;
