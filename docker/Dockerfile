FROM golang:1.23-bookworm AS api
WORKDIR /repo/services/api-go
COPY services/api-go/go.mod ./
COPY services/api-go ./
EXPOSE 8787
CMD ["go", "run", "./cmd/hackd"]

FROM golang:1.23-bookworm AS hackctl
WORKDIR /workspace/tools/hackctl
COPY tools/hackctl/go.mod ./
COPY tools/hackctl ./
ENTRYPOINT ["go", "run", "./cmd/hackctl"]

FROM node:22-bookworm AS web
WORKDIR /repo
COPY package*.json ./
COPY apps/web/package.json apps/web/package.json
RUN npm ci --ignore-scripts --workspaces --include-workspace-root
COPY apps/web apps/web
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /repo/apps/web
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
