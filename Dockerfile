# Dockerfile to build and run project's tests (including Cypress tests)
#  from environments not supporting Cypress.

# Latest version of cypress/browsers, which is all o/s deps, no cypress, and some browsers.
# ref: https://github.com/cypress-io/cypress-docker-images
# ref: https://hub.docker.com/r/cypress/browsers/tags
FROM cypress/browsers:node-18.14.1-chrome-111.0.5563.146-1-ff-111.0.1-edge-111.0.1661.54-1 as setup-stage

# First generate an up to date version of cypress/included following the last Dockerfile:
#  https://github.com/cypress-io/cypress-docker-images/blob/master/included/12.3.0/Dockerfile

ENV NEXT_TELEMETRY_DISABLED=1
ENV CYPRESS_CRASH_REPORTS=0
#ENV DEBUG=cypress:*

# avoid too many progress messages
# https://github.com/cypress-io/cypress/issues/1243
ENV CI=1 \
# disable shared memory X11 affecting Cypress v4 and Chrome
# https://github.com/cypress-io/cypress-docker-images/issues/270
  QT_X11_NO_MITSHM=1 \
  _X11_NO_MITSHM=1 \
  _MITSHM=0 \
  # point Cypress at the /root/cache no matter what user account is used
  # see https://on.cypress.io/caching
  CYPRESS_CACHE_FOLDER=/root/.cache/Cypress \
  # Allow projects to reference globally installed cypress
  NODE_PATH=/usr/local/lib/node_modules

# CI_XBUILD is set when we are building a multi-arch build from x64 in CI.
# This is necessary so that local `./build.sh` usage still verifies `cypress` on `arm64`.
ARG CI_XBUILD

# should be root user
RUN echo "whoami: $(whoami)" \
  && npm install -g typescript \
  && npm install -g "cypress@12.9.0" \
  && (node -p "process.env.CI_XBUILD && process.arch === 'arm64' ? 'Skipping cypress verify on arm64 due to SIGSEGV.' : process.exit(1)" \
    || (cypress verify \
    # Cypress cache and installed version
    # should be in the root user's home folder
    && cypress cache path \
    && cypress cache list \
    && cypress info \
    && cypress version)) \
  # give every user read access to the "/root" folder where the binary is cached
  # we really only need to worry about the top folder, fortunately
  && ls -la /root \
  && chmod 755 /root \
  # Show where Node loads required modules from
  && node -p 'module.paths' \
  # should print Cypress version
  # plus Electron and bundled Node versions
  && cypress version \
  && echo  " node version:    $(node -v) \n" \
    "npm version:     $(npm -v) \n" \
    "typescript version:  $(tsc -v) \n" \
    "debian version:  $(cat /etc/debian_version) \n" \
    "user:            $(whoami) \n" \
    "chrome:          $(google-chrome --version || true) \n" \
    "firefox:         $(firefox --version || true) \n"

FROM setup-stage as build-stage

# Hopefully we have a working Cypress binary at this point.
# Install our app and run our task...

WORKDIR /app
ADD . .
RUN npm install
RUN npm run build

FROM build-stage as run-stage

EXPOSE 4173 5173

# (A) Use one of the following to drop to a shell inside the container:
#  docker compose run app
#  docker run -it -p 4173 -p 5173 app bash

# OR

# (B) Run tests using docker compose:
#  docker compose up
CMD npm run test-all
