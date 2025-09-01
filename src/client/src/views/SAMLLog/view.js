import React from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import { BlockUI } from 'primereact/blockui';
import Sticky from 'react-sticky-el';
import AceEditor from '../../components/AceEditor/';
import moment from 'moment';
import "./style.css";

function view(me) { 
    return (
        <div id="SAMLLog" className="animated fadeIn">
            <p className="title h3">Web Browser SSO Last Execution Log</p>
            { me.state.report && me.state.report.lastlog && me.state.report.lastlog.details && (
            <div className="row">
                <div className="col-md-8">
                    <div className="main">
                        <div className="row">
                            <div className="col-md-12">
                                <div className="row"> 
                                    <div className="col-sm-12">
                                        <p className="h4"><a id="metadata" className="anchor">Metadata</a></p>
                                        <AceEditor mode="xml" code={me.state.report.lastlog.details.metadata.configuration} />
                                    </div>
                                    <div className="col-sm-12">
                                        <p className="h4 mt-5"><a id="authnrequest" className="anchor">AuthnRequest</a></p>
                                        <AceEditor mode="xml" code={me.state.report.lastlog.details.authrequest.Message} />
                                    </div>
                                    <div className="col-sm-12">
                                        <p className="h4 mt-5"><a id="authnresponse" className="anchor">AuthnResponse</a></p>
                                        <AceEditor mode="xml" code={me.state.report.lastlog.details.authresponse.Message} />
                                    </div>
                                    <div className="col-sm-12">
                                        <p className="h4 mt-5"><a id="log" className="anchor">Report Log</a></p>
                                        <AceEditor mode="json" code={me.state.report.lastlog.details.report} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">   
                    <Sticky stickyClassName="sticky-tools" topOffset={-50}>
                        <div className="tools">
                            <div className="col-sm-12">
                                <a href="#metadata" className="btn btn-primary">Metadata</a>
                                <a href="#authnrequest" className="btn btn-primary">AuthnRequest</a>
                                <a href="#authnresponse" className="btn btn-primary">AuthnResponse</a>
                                <a href="#log" className="btn btn-primary">Report Log</a>
                                <button type="button" className="btn btn-success"
                                    onClick={()=>{me.print()}}>
                                    <i className="fa fa-print" aria-hidden="true"></i> Print
                                </button>
                            </div>
                        </div>
                    </Sticky>
                </div>
            </div>
            )}

            { (!me.state.report || !me.state.report.lastlog || !me.state.report.lastlog.details) && (
            <div className="row">
                <div className="col-md-12">
                    <div className="main">
                        <i>The log is empty. Check if the authentication request was successfully completed.</i> 
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}

export default view;                        
