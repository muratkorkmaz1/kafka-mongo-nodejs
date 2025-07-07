

# ⚙️ Kafka-Mongo-Node.js Microservice

This project demonstrates a simple microservice architecture with **Node.js**, **Kafka**, and **MongoDB** — deployed via **Kubernetes** using **Helm** and **ArgoCD**, and built with **GitHub Actions**.

---

## 📦 Components

- **🟢 Producer**: Accepts HTTP POST requests and sends messages to Kafka.
- **🔵 Consumer**: Consumes Kafka messages and stores them in MongoDB.
- **🐳 Kafka & MongoDB**: External services running via Docker Compose.

---

## 🛠️ Requirements

- Docker
- Minikube
- Helm
- kubectl
- ArgoCD
- GitHub Actions

---

## 🐋 Local Docker Setup (Kafka + MongoDB)

Start Zookeeper, Kafka, and MongoDB services locally:

```bash
docker-compose up -d
```

You can verify logs with:

```bash
docker logs kafka-mongo-nodejs-kafka-1
docker logs kafka-mongo-nodejs-mongodb-1
```

---

## 🚀 Kubernetes Deployment via ArgoCD

### 🧩 Helm Charts

Charts are located in:

```
chart/
├── producer/
│   ├── templates/
│   ├── values.yaml
├── consumer/
│   ├── templates/
│   ├── values.yaml
```

Each chart includes:
- deployment.yaml
- service.yaml
- values.yaml

### 📁 ArgoCD Manifests

ArgoCD application definitions are located in:

```
argocd/
├── producer.yaml
├── consumer.yaml
```

### 🚀 Deploy with kubectl:

```bash
kubectl apply -f argocd/producer.yaml
kubectl apply -f argocd/consumer.yaml
```

---

## 🌐 Port Forwarding for Testing

Expose the producer service:

```bash
kubectl port-forward svc/producer 3000:3000
```

Send a test message:

```bash
curl -X POST http://localhost:3000/submit \
  -H "Content-Type: application/json" \
  -d '{"value": "test-message"}'
```

---

## 🔁 CI/CD with GitHub Actions

GitHub Actions workflow is defined in:

```
.github/workflows/docker-build-push.yml
```

On each push to `main` branch:

- Builds Docker image for producer and consumer
- Pushes to Docker Hub with tag: `latest`

### 🛡️ Secrets Required

Go to GitHub → Settings → Secrets and variables → Actions:

Add the following:

| Name              | Description                  |
|-------------------|------------------------------|
| DOCKER_USERNAME   | Your Docker Hub username     |
| DOCKER_PASSWORD   | Your Docker Hub access token |

---

## 📊 Monitoring (Future Work)

Planned setup:
- Prometheus + Grafana using Helm
- CPU and Memory usage dashboards

---

## 📂 Project Structure

```
kafka-mongo-nodejs/
├── producer/                  
├── consumer/                  
├── docker/                    
├── chart/                     
├── argocd/                    
├── .github/workflows/         
├── docker-compose.yml         
└── README.md
```

---

## ✅ End-to-End Flow

1. Client sends `POST /submit` to Producer
2. Producer sends message to Kafka topic
3. Consumer listens and saves it to MongoDB
4. Everything is deployed via ArgoCD and versioned with GitHub Actions

---

Made with 💻 by [muratkorkmaz1](https://github.com/muratkorkmaz1)
