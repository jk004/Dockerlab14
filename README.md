Budowanie:
docker compose up -d --build



Test bind mounts:

docker container inspect compose2-db-1 | jq '.[].Mounts'

test dzialania aplikacji:
curl -i http://localhost:3000/animal
