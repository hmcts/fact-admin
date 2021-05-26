FROM postgres:11.9-alpine

RUN addgroup -S fact
RUN adduser -u 1000 -S -G fact fact
USER fact

COPY create-multiple-postgresql-databases.sh /docker-entrypoint-initdb.d/
