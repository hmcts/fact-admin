#!/usr/bin/env bash

IDAM_URI="http://localhost:5000"
REDIRECT_URI="http://localhost:3300/oauth2/callback"
CLIENT_ID="fact_admin"
CLIENT_SECRET="fact_admin_secret"

authToken=$(curl -s -H 'Content-Type: application/x-www-form-urlencoded' -XPOST "${IDAM_URI}/loginUser?username=idamOwner@hmcts.net&password=Ref0rmIsFun" | docker run --rm --interactive stedolan/jq  -r .api_auth_token)

#Create a client
curl -XPOST \
  ${IDAM_URI}/services \
 -H "Authorization: AdminApiAuthToken ${authToken}" \
 -H "Content-Type: application/json" \
 -d "{ \"activationRedirectUrl\": \"\", \"allowedRoles\": [\"fact-admin\"], \"description\": \"${CLIENT_ID}\", \"label\": \"${CLIENT_ID}\", \"oauth2ClientId\": \"${CLIENT_ID}\", \"oauth2ClientSecret\": \"${CLIENT_SECRET}\", \"oauth2RedirectUris\": [\"${REDIRECT_URI}\" ], \"oauth2Scope\": \"string\", \"onboardingEndpoint\": \"string\", \"onboardingRoles\": [\"fact-admin\"], \"selfRegistrationAllowed\": false}"

email=hmcts.fact@gmail.com
password=Pa55word11
forename=test
surname=test
rolesJson='[{"code": "fact-admin"}]'
data='{"email":"'${email}'","forename":"'${forename}'","surname":"'${surname}'","password":"'${password}'","levelOfAccess":1, "roles": '${rolesJson}', "userGroup": {"code": "fact-admin"}}'

curl -v -XPOST \
  ${IDAM_URI}/testing-support/accounts \
  -H "Content-Type: application/json" \
  -d "${data}"
