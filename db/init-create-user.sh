#!/bin/bash
set -e

# skrypt uruchamiany przez entrypoint Postgresa
if [ -f /run/secrets/db_password ]; then
  PWD=$(cat /run/secrets/db_password)
  export PGPASSWORD="$POSTGRES_PASSWORD"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE ROLE dockerapp LOGIN PASSWORD '${PWD}';
    GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO dockerapp;
    -- jeśli chcesz nadać uprawnienia do tabel w schemacie public:
    -- \c ${POSTGRES_DB}
    -- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dockerapp;
EOSQL
fi
