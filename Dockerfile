# ---- Base image ----
FROM hmctspublic.azurecr.io/base/node:18-alpine as base

USER root
RUN corepack enable
USER hmcts

COPY --chown=hmcts:hmcts . .

# ---- Build image ----
FROM base as build

RUN PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=true yarn install && \
    yarn build:prod && \
    rm -rf webpack/ webpack.config.js

# ---- Runtime image ----
FROM base as runtime

# Copy node_modules from build stage
COPY --from=build $WORKDIR/node_modules ./node_modules
COPY --from=build $WORKDIR/.yarn ./yarn
COPY --from=build $WORKDIR/.yarnrc.yml ./yarnrc.yml

COPY --from=build $WORKDIR/src/main ./src/main
EXPOSE 3300
