# Проверка задания 1

```bash
npm test
npm run migrate

curl http://localhost:8080/health
curl http://localhost:8080/api/quote
```

---

# Проверка задания 2

```bash
docker build -t rcsp-task2-check .
docker run --rm -d --name rcsp-task2-check -p 8080:8080 rcsp-task2-check
until curl http://localhost:8080/health; do sleep 1; done
curl http://localhost:8080/api/quote
docker stop rcsp-task2-check
```

---

# Проверка задания 3

```bash
docker build -t rcsp-config-check .
docker run --rm -d --name rcsp-config-5000 -e PORT=5000 -e SERVICE_NAME=config-dev -p 5000:5000 rcsp-config-check
until curl http://localhost:5000/health; do sleep 1; done
docker stop rcsp-config-5000
docker run --rm -d --name rcsp-config-5001 -e PORT=5001 -e SERVICE_NAME=config-prod -p 5001:5001 rcsp-config-check
until curl http://localhost:5001/health; do sleep 1; done
docker stop rcsp-config-5001
```

---

# Проверка задания 4уу

```bash
docker compose up -d --build --scale app=3
until curl http://localhost:8080/health; do sleep 3; done
curl http://localhost:8080/api/quote
#docker compose ps

APP=$(docker compose ps -q app | head -n 1)
docker exec "$APP" npm run create-admin -- --email=stateless-demo@example.com
docker compose exec -T postgres psql -U app_user -d quotes_db -c "select email from admins where email='stateless-demo@example.com';"

docker stop "$APP"
curl http://localhost:8080/health
curl http://localhost:8080/api/quote

docker compose stop app
docker compose up -d --scale app=3
until curl http://localhost:8080/health; do sleep 3; done
docker compose exec -T postgres psql -U app_user -d quotes_db -c "select email from admins where email='stateless-demo@example.com';"

docker compose down
```


add new line