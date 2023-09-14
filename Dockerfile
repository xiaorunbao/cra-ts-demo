###################
# Create base image with PNPM installed
###################

FROM node:18-alpine AS pnpm
ENV CI=1
RUN apk --no-cache add libc6-compat
RUN npm install -g pnpm

###################
# Copy just my dependency files
###################

FROM pnpm AS deps
WORKDIR /app
RUN apk add --no-cache --virtual jq
COPY package.json pnpm-lock.yaml .npmrc ./

###################
# Install all dependencies and build
###################

FROM deps AS builder
WORKDIR /app
RUN --mount=type=secret,id=github_token \
    GITHUB_TOKEN=$(cat /run/secrets/github_token) \
    pnpm fetch
COPY . .
RUN --mount=type=secret,id=github_token \
    GITHUB_TOKEN=$(cat /run/secrets/github_token) \
    pnpm install --offline
RUN NODE_ENV=production REACT_APP_BUILD=`date '+%Y%m%d-%H%M%S'` REACT_APP_VERSION=`jq .version package.json` pnpm build

###################
# production
###################

FROM 36node/nginx-react:0.1

ENV DEBUG=off \
    NODE_ENV=production
COPY --from=builder /app/build /app