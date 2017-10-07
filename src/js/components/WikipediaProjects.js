import React, { PropTypes } from 'react';
import { SOCKET_URL,
    PROJECT_LIST_COMMAND,
    PAGE_LIST_COMMAND,
    PAGE_QUERY_COMMAND,
    PROJECT_SUB_COMMAND,
    PROJECT_UNSUB_COMMAND,
    PAGE_SUB_COMMAND,
    PAGE_UNSUB_COMMAND,
    PROJECT_UPDATE,
    PAGE_UPDATE
} from '../constants';
import * as lib from '../lib';

class WikipediaProject extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            connected: false,
            projSubFeed: [],
            pageSubFeed: []
        };
    }

    componentWillMount() {
        this.establishConnection();
    }

    establishConnection() {
        this.wikiSocket = new WebSocket(SOCKET_URL);
        this.wikiSocket.onopen = (event) => {
            this.setState({
                connected: true,
            });
            this.getProjects();
        };
        this.wikiSocket.onmessage = (event) => {
            this.handleMsg(event);
        };
    }

    handleMsg(event) {
        let retObj = JSON.parse(event.data);
        if (retObj) {
            switch (retObj.name) {
                case PROJECT_LIST_COMMAND:
                    this.setProjectList(retObj.data);
                    break;
                case PAGE_LIST_COMMAND:
                    this.setPageList(retObj.data);
                    break;
                case PAGE_QUERY_COMMAND:
                    this.setPage(retObj.data);
                    break;
                case PROJECT_UPDATE:
                    this.updateProjSubFeed(retObj.data);
                    break;
                case PAGE_UPDATE:
                    this.updatePageSubFeed(retObj.data);
                    break;
                default:
                    console.error('response unrecognized');
            }
        }
    }

    sendMsg(command, argsObj) {
        let requestMsg = {
            id: lib.uniqueId(),
            name: command
        };
        if (argsObj) {
            requestMsg = Object.assign(requestMsg, {args: argsObj});
        }
        if (this.wikiSocket) {
            this.wikiSocket.send(JSON.stringify(requestMsg));
        }
    }

    setProjectList(projects) {
        this.setState({projects});
    }

    setPageList(pages) {
        this.setState({pages});
    }

    setPage(page) {
        this.setState({page});
    }

    getProjects() {
        this.sendMsg(PROJECT_LIST_COMMAND);
    }

    getPageList(project) {
        this.sendMsg(PAGE_LIST_COMMAND, {project});
    }

    getPage(pageId) {
        this.sendMsg(PAGE_QUERY_COMMAND, {pageId});
    }

    updateProjSubFeed(data) {
        let newProjSubFeed = this.state.projSubFeed.concat({label: 'Project Update'});
        this.setState({
            pages: data,
            projSubFeed: newProjSubFeed
        });
    }

    updatePageSubFeed(data) {
        let newPageSubFeed = this.state.pageSubFeed.concat({label: 'Page Update', lastrevid: data.lastrevid});
        this.setState({
            page: data,
            pageSubFeed: newPageSubFeed
        });
    }

    handleProjectClick(selectedProject, event) {
        this.setState({selectedProject});
        this.getPageList(selectedProject);
    }

    handlePageClick(selectedPage, event) {
        this.setState({selectedPage});
        this.getPage(selectedPage.pageid);
    }

    handleProjSubClick(project) {
        this.sendMsg(PROJECT_SUB_COMMAND, {project});
        this.setState({subscribedProject: project});
    }

    handleProjUnsubClick(project) {
        this.sendMsg(PROJECT_UNSUB_COMMAND);
        this.setState({
            subscribedProject: false,
            projSubFeed: []
        });
    }

    handlePageSubClick(page) {
        this.sendMsg(PAGE_SUB_COMMAND, {pageId: page.pageid});
        this.setState({subscribedPage: page.pageid});
    }

    handlePageUnsubClick(project) {
        this.sendMsg(PAGE_UNSUB_COMMAND);
        this.setState({
            subscribedPage: false,
            pageSubFeed: []
        });
    }

    renderPageMeta() {
        let { page } = this.state;
        if (!page) {
            return;
        }
        let metaModelArr = [];
        Object.entries(page).map(([key, val]) => {
            if (key !== 'revisions' && val) {
                metaModelArr.push({label:key, val: val});
            }
        });
        return (
            <div className='col'>
                <ul>
                    <For key='index' each='prop' of={metaModelArr}>
                        <li key={index} className='pad'><strong>{prop.label}: </strong>{prop.val}</li>
                    </For>
                </ul>
                <strong className='pad'>Revisions</strong>
                <ul>
                    <For key='index' each='revision' of={page.revisions}>
                        <li key={index} className='pad'><strong>{revision.revid}: </strong>{revision.timestamp}</li>
                    </For>
                </ul>
            </div>
        );
    }

    renderSubPanel() {
        let { selectedProject, selectedPage } = this.state;
        return (
            <div className='col'>
                <If condition={selectedProject}>
                    <div className='pad'>
                        <strong>Selected Project: </strong>
                        <span className='pad'>{selectedProject}</span>
                        <span className='pad'>
                            <button className='btn greenBtn' onClick={this.handleProjSubClick.bind(this, selectedProject)}>Subscribe</button>
                        </span>
                        <span className='pad'>
                            <button className='btn redBtn' onClick={this.handleProjUnsubClick.bind(this, selectedProject)}>Unsubscribe</button>
                        </span>
                    </div>
                </If>
                <If condition={selectedPage}>
                    <div className='pad'>
                        <strong>Selected Page: </strong>
                        <span className='pad'>{selectedPage.title}</span>
                        <span className='pad'>
                            <button className='greenBtn' onClick={this.handlePageSubClick.bind(this, selectedPage)}>Subscribe</button>
                        </span>
                        <span className='pad'>
                            <button className='redBtn' onClick={this.handlePageUnsubClick.bind(this, selectedPage)}>Unsubscribe</button>
                        </span>
                    </div>
                </If>
            </div>
        );
    }

    renderProjSubFeed() {
        let { projSubFeed } = this.state;
        return (
            <If condition={projSubFeed && projSubFeed.length}>
                <div className='col'>
                    <ul>
                        <For key='index' each='update' of={projSubFeed}>
                            <li key={index} className='pad'>{update.label}</li>
                        </For>
                    </ul>
                </div>
            </If>
        );
    }

    renderPageSubFeed() {
        let { pageSubFeed } = this.state;
        return (
            <If condition={pageSubFeed && pageSubFeed.length}>
                <div className='col'>
                    <ul>
                        <For key='index' each='update' of={pageSubFeed}>
                            <li key={index} className='pad'>{update.label} {update.lastrevid}</li>
                        </For>
                    </ul>
                </div>
            </If>
        );
    }

    render() {
        let { connected, projects, pages, selectedPage } = this.state;
        return (
            <div>
                <div className='flex-grid'>
                    <div className='col v-box'>
                        <div className=''>
                            <Choose>
                                <When condition={connected}>
                                    <p>Connected</p>
                                </When>
                                <Otherwise>
                                    <p>Establishing Connection</p>
                                </Otherwise>
                            </Choose>
                        </div>
                        <h2>Projects</h2>
                        <If condition={projects && projects.length}>
                            <ul>
                                <For key='index' each='project' of={projects}>
                                    <li key={index} className='proj pad' onClick={this.handleProjectClick.bind(this, project)}>{project}</li>
                                </For>
                            </ul>
                        </If>
                    </div>
                    <div className='col v-box'>
                        <If condition={pages && pages.length}>
                            <ul>
                                <For key='index' each='page' of={pages}>
                                    <li key={index} className='page pad' onClick={this.handlePageClick.bind(this, page)}>{page.title}<br/>Last Revision Id: {page.lastrevid}</li>
                                </For>
                            </ul>
                        </If>
                    </div>
                    <div className='col v-box'>
                        {this.renderSubPanel()}
                        {this.renderPageMeta()}
                        {this.renderProjSubFeed()}
                        {this.renderPageSubFeed()}
                    </div>
                </div>
            </div>
        );
    }

}

export default WikipediaProject;
