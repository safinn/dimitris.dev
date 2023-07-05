# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.2.0
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Remix"

# Remix app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

ARG PNPM_VERSION=8.6.0
RUN npm install -g pnpm@$PNPM_VERSION


# Throw-away build stage to reduce size of final image
FROM base as build

# Commit SHA used in build/info.json
ARG COMMIT_SHA
ARG BOT_GITHUB_TOKEN

ENV COMMIT_SHA=$COMMIT_SHA
ENV BOT_GITHUB_TOKEN=$BOT_GITHUB_TOKEN

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential

# Install node modules
COPY --link package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy application code
COPY --link . .

# Build application
RUN pnpm run build

# Remove development dependencies
RUN pnpm prune --prod


# Final stage for app image
FROM base

# Install, configure litefs
COPY --from=flyio/litefs:0.5.1 /usr/local/bin/litefs /usr/local/bin/litefs
COPY --link other/litefs.yml /etc/litefs.yml

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y ca-certificates fuse3 sqlite3 && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy built application
COPY --from=build /app /app

# Setup volume for sqlite3
RUN mkdir -p /data /litefs
VOLUME /data

# Setup envs for sqlite3
ENV LITEFS_DIR="/litefs"
ENV CACHE_DATABASE_PATH="$LITEFS_DIR/cache.db"
ENV PORT=3001
ENV NODE_ENV="production"

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$CACHE_DATABASE_PATH" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

ENTRYPOINT ["litefs", "mount", "--"]

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "pnpm", "run", "start" ]
