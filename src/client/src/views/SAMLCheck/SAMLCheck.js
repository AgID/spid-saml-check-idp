import React, { Component } from 'react';
import view from "./view.js";
import Utility from '../../utility';
import Services from '../../services';
import config_test from '../../../../config/test.json';
import ReduxStore from "../../redux/store";
import Actions from "../../redux/main/actions";


class SAMLCheck extends Component {

  constructor(props) {
    super(props);

    this.state = {
      testsuite: "saml-core",
      description: "",
      cases: [],

      selected: {
        label: null,
        value: {
          description: null
        }
      },

      authrequest: {
        Message: '',
        ProtocolBinding: null,
        SAMLRequest: null,
        RelayState: null,
        SigAlg: null,
        Signature: null,
        Destination: null
      }
    }
  }	

  componentDidMount() { 
    this.getTestCases();
  }

  getTestCases() {
    let service = Services.getMainService(); 
    Utility.blockUI(true);
    service.getTestSuite(
      this.state.testsuite,
      (testsuite) => {
        Utility.blockUI(false);   
        let cases = [];
        for(let t in testsuite.cases) {
          cases.push({
            id: t,
            label: testsuite.cases[t].name,
            value: testsuite.cases[t]
          });
        }
  
        this.setState({
          description: testsuite.description,
          cases: cases,
          selected: cases[0]
        }, ()=> {
          this.selectCase(this.state.selected)
        });
      }, 
      (error) => { 
        Utility.blockUI(false);
        this.setState({
          testsuite: "saml-core",
          description: "",
          cases: []
        });
        Utility.showModal({
            title: "Error",  
            body: error, 
            isOpen: true
        });
      }
    );
  }

  selectCase(val) {
    Utility.log("Selected Case", val);
    let service = Services.getMainService(); 
    Utility.blockUI(true);
    service.getAuthorizationRequest(
      val.id,
      (authrequest) => {
        Utility.blockUI(false);   
        this.setState({ 
          selected: val, 
          authrequest: authrequest 
        }, ()=> {

        });
      }, 
      (error) => { 
        Utility.blockUI(false);
        Utility.showModal({
            title: "Error",
            body: error,
            isOpen: true
        });
      }
    );
  }
 
  sendAuthorizationRequest() {    
    let authrequest = this.state.authrequest;

    if(typeof authrequest.Destination === 'string'
      &&authrequest.Destination!=null 
      && authrequest.SAMLRequest!=null) {

        if(authrequest.ProtocolBinding=='urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST') {

            document.getElementById("form_authrequest").submit(); 

        } else { // urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect

          let url = authrequest.Destination + 
            "?SAMLRequest=" + authrequest.SAMLRequest +
            "&RelayState=" + authrequest.RelayState +
            "&SigAlg=" + authrequest.SigAlg +
            "&Signature=" + authrequest.Signature;

          console.log("AuthnRequest URL", url);

          window.open(url, '_blank');
        }
    } else {
      Utility.showModal({
        title: "Error",
        body: "Destination non disponibile. Verificare SingleSignOnService nel metadata.",
        isOpen: true
      }); 
    }
  }


  render() { 
	  return view(this);
  }
  
}

export default SAMLCheck;
