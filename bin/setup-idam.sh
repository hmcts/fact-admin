#!/usr/bin/env bash

IDAM_URI="http://localhost:5000"
REDIRECT_URI="http://localhost:3451/oauth2redirect"
CLIENT_ID="ccd_gateway"
CLIENT_SECRET="ccd_gateway_secret"

authToken=$(curl -s -H 'Content-Type: application/x-www-form-urlencoded' -XPOST "${IDAM_URI}/loginUser?username=idamOwner@hmcts.net&password=Ref0rmIsFun" | docker run --rm --interactive stedolan/jq  -r .api_auth_token)

#Create a client
curl -XPOST \
  ${IDAM_URI}/services \
 -H "Authorization: AdminApiAuthToken ${authToken}" \
 -H "Content-Type: application/json" \
 -d "{ \"activationRedirectUrl\": \"\", \"allowedRoles\": [\"fact-admin\"], \"description\": \"${CLIENT_ID}\", \"label\": \"${CLIENT_ID}\", \"oauth2ClientId\": \"${CLIENT_ID}\", \"oauth2ClientSecret\": \"${CLIENT_SECRET}\", \"oauth2RedirectUris\": [\"http://localhost:3300/oauth2/callback\" ], \"oauth2Scope\": \"string\", \"onboardingEndpoint\": \"string\", \"onboardingRoles\": [\"fact-admin\"], \"selfRegistrationAllowed\": false}"

email=test@test.com
password=Pa55word1
forename=test
surname=test
rolesJson='[{"code": "fact-admin"}]'
data='{"email":"'${email}'","forename":"'${forename}'","surname":"'${surname}'","password":"'${password}'","levelOfAccess":1, "roles": '${rolesJson}', "userGroup": {"code": "fact-admin"}}'

curl -v -XPOST \
  ${IDAM_URI}/testing-support/accounts \
  -H "Content-Type: application/json" \
  -d "${data}"

##Assign all the roles to the ccd_gateway client
#curl -XPUT \
#  ${IDAM_URI}/services/${CLIENT_ID}/roles \
# -H "Authorization: AdminApiAuthToken ${authToken}" \
# -H "Content-Type: application/json" \
# -d '["fact-admin"]'
#
