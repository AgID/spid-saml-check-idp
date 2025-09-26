# spid-saml-check-idp
SPID SAML Conformance Test Tool for IdP

<img src="doc/spid-saml-check-idp.gif" />

## Requirements
- Node.js v.22
- libxml2-utils

## Setup
clone the repository
```
git clone https://github.com/AgID/spid-saml-check-idp.git
cd spid-saml-check-idp/src
```
copy and edit configurations
```
cp -R config_sample config
```
create Service Provider signing and encryption certificates
```
cd config && sh make_cert.sh && cd .. 
```
create directory for database
```
mkdir data
```
compile and build the client
```
cd client && npm i && npm run build && cd ..
```
compile the server
```
cd server && npm i && cd ..
```

## Run
```
node server/spid-saml-check-idp
```
