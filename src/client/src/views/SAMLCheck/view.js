import React from 'react';
import { BlockUI } from 'primereact/blockui';
import Select from 'react-select';
import Sticky from 'react-sticky-el';
import AceEditor from '../../components/AceEditor/';
import './switches.css';
import './style.css';

function view(me) { 
    return (
        <div id="SAMLCheck" className="animated fadeIn">
            <p className="title h3">Web Browser SSO Check</p>
            <div className="row">
                <div className="col-md-8">
                    <div className="main">
                        <div className="row">
                            <div className="col-sm-12">
                                <h4><a id="testcase" className="anchor">Test Case</a></h4>
                                <label for="testcase-selector" className="mb-3">
                                    Select the testcase to check and send the authentication request
                                </label>
                                <Select id="testcase-selector"
                                    name="testcase-selector"
                                    options={me.state.cases}
                                    value={me.state.selected}
                                    onChange={(val)=> {me.selectCase(val)}}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12 mb-3">
                                <h4 className="mt-5"><a id="description" className="anchor">Description</a></h4>
                                <p className="test-description">{me.state.selected.value.description}</p>
                                <h4 className="mt-5"><a id="diagram" className="anchor">Sequence Diagram</a></h4>
                                <img className="testcase-diagram" src={"../img/testcase/" + me.state.selected.value.image + ".svg"} /> 

                                <h4 className="mt-5"><a id="request" className="anchor">AuthnRequest</a></h4>
                                <AceEditor mode="xml" code={me.state.authrequest.Message} />

                                <h4 className="mt-5"><a id="testlist" className="anchor">Test List</a></h4>
                                {me.state.selected &&
                                    me.state.selected.value &&
                                    me.state.selected.value.hook &&
                                    Object.keys(me.state.selected.value.hook).map((h, i)=> {
                                        return (
                                            <div key={i} className="mt-3">
                                                <h5>{h}</h5>
                                                <div className="table-responsive">
                                                    <table className="table table-test">
                                                        <tr className="table-test-header">
                                                            <th className="table-test-num">#</th>
                                                            <th className="table-test-description">Description</th>
                                                        </tr>
                                                        {me.state.selected.value.hook[h].map((t, j)=> {
                                                            return(
                                                                <tr key={j} className="table-test-row">
                                                                    <td className="table-test-row-num">{t.num}</td>
                                                                    <td className="table-test-row-description">{t.description}</td>
                                                                </tr>
                                                            );
                                                        })} 
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <Sticky stickyClassName="sticky-tools" topOffset={-50}>
                        <div className="tools">
                            <div className="col-sm-12">
                                <a href="#testcase" className="btn btn-primary">Test Case</a>
                                <a href="#description" className="btn btn-primary">Description</a>
                                <a href="#diagram" className="btn btn-primary">Sequence Diagram</a>
                                <a href="#request" className="btn btn-primary">AuthnRequest</a>
                                <a href="#testlist" className="btn btn-primary">Test List</a>
                                <button className="btn btn-lg btn-send btn-success w-100 btn-send"
                                    onClick={()=> {me.sendAuthorizationRequest()}}> 
                                    <i className="fa fa-paper-plane-o me-2" aria-hidden="true"></i>
                                    Send Authentication Request
                                </button>
                                <form id="form_authrequest" method="POST" target="_blank" action={me.state.authrequest.Destination}>
                                    <input type="hidden" name="SAMLRequest" value={me.state.authrequest.SAMLRequest} />
                                    <input type="hidden" name="RelayState" value={me.state.authrequest.RelayState} />                                    
                                </form>
                            </div>
                        </div>  
                    </Sticky>  
                </div>
            </div>
        </div>
    );
}

export default view;                        
