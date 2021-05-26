FROM postgres:11.9-alpine
RUN groupadd -g 1000 fact && \
    useradd -r -u 1000 -g fact fact
USER fact

COPY create-multiple-postgresql-databases.sh /docker-entrypoint-initdb.d/
