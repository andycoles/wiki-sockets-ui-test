import React from 'react';
import { render } from 'react-dom';
import WikipediaProjects from './components/WikipediaProjects';
import '../scss/styles.scss';

const root = document.getElementById('react-app');

if (root) {
    render(
        <WikipediaProjects/>, root);
}
