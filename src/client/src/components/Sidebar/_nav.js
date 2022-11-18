export default {
  items: [
    {
      name: 'Metadata',
      icon: 'fa fa-tag',
      open: true,
      sessionRequired: false,
      children: [
        {
          name: 'Download',  
          url: '/metadata/download',   
          sessionRequired: false, 
        },
        {
          name: 'Check',  
          url: '/metadata/check',  
          sessionRequired: false
        },
      ]
    },
    {
      name: 'Web Browser SSO',  
      icon: 'fa fa-paper-plane', 
      sessionRequired: true,
      children: [
        {
          name: 'Start Check',  
          url: '/saml/check',      
        },
        {
          name: 'Report',  
          url: '/saml/report',      
        },
        {
          name: 'Log',  
          url: '/saml/log',      
        }
      ]
    },
    {
      name: 'Logout',
      icon: 'fa fa-sign-out',
      sessionRequired: false,
      url: '/logout'
    }
  ]
};
