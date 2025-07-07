
# Kafka-Mongo NodeJS Monitoring with CI/CD

This project demonstrates a complete Kafka-based data pipeline using a Node.js producer and consumer, MongoDB for storage, and Grafana/Prometheus for monitoring. Kubernetes deployments are managed with Helm and ArgoCD, while GitHub Actions handles CI/CD.

---

## 📦 Components

- **Kafka Producer** – Publishes messages to Kafka topic
- **Kafka Consumer** – Reads messages and stores them in MongoDB
- **MongoDB** – Stores logs
- **Kafka + Zookeeper** – Messaging layer
- **Prometheus + Grafana** – Monitoring
- **ArgoCD** – GitOps-based Kubernetes deployment
- **GitHub Actions** – CI/CD pipeline for Docker builds and deployments

---

## 🚀 Getting Started

### 🔧 Prerequisites

- Docker
- Minikube
- Helm
- kubectl
- ArgoCD CLI (optional)

---

## 🧱 Project Structure

```
.
├── consumer/
├── producer/
├── docker/
├── chart/
│   ├── consumer/
│   └── producer/
├── argocd/
│   ├── consumer.yaml
│   └── producer.yaml
├── .github/workflows/
│   ├── consumer.yml
│   └── producer.yml
└── README.md
```

---

## ⚙️ Deployment

### 1. Start Minikube

```bash
minikube start
```

### 2. Enable ArgoCD

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 3. Access ArgoCD UI

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Access: [https://localhost:8080](https://localhost:8080)

### 🔑 Get ArgoCD admin password:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 --decode
```

---

### 4. Deploy with ArgoCD

```bash
kubectl apply -f argocd/producer.yaml
kubectl apply -f argocd/consumer.yaml
```

---

## 🔍 Monitoring Setup

### 1. Install Prometheus & Grafana with Helm

```bash
kubectl create namespace monitoring

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring
helm install grafana grafana/grafana -n monitoring
```

---

### 2. Get Grafana admin password

```bash
kubectl get secret grafana-admin -n monitoring -o jsonpath="{.data.GF_SECURITY_ADMIN_PASSWORD}" | base64 --decode
```

### 3. Expose Grafana (Option 1: NodePort)

```bash
kubectl patch svc grafana -n monitoring -p '{"spec": {"type": "NodePort", "ports": [{"port":3000,"targetPort":3000,"nodePort":32000}]}}'
```

Then access Grafana: [http://localhost:32000](http://localhost:32000)

### 🔑 Default credentials

- **Username:** `admin`
- **Password:** `your_decoded_password`

---

### 4. Add Prometheus Datasource in Grafana

Use this URL in data source settings:

```
http://prometheus-kube-prometheus-prometheus.monitoring.svc.cluster.local:9090
```

---

## ✅ GitHub Actions – CI/CD

### 1. Add GitHub Secrets

In your GitHub repo, go to **Settings > Secrets and variables > Actions**, then add:

- `DOCKER_USERNAME` – your Docker Hub username
- `DOCKER_PASSWORD` – your Docker Hub password or PAT

### 2. Commit and Push

```bash
git add .
git commit -m "CI/CD and Monitoring Setup"
git push origin main
```

CI will automatically:

- Build Docker images
- Push them to Docker Hub
- Trigger deployment with ArgoCD

---

## 📮 Test Producer Endpoint

```bash
curl -X POST http://localhost:3000/submit \
     -H "Content-Type: application/json" \
     -d '{"value": "hello from curl"}'
```

---

## 📊 Import Dashboards

In Grafana:

- Go to **+ > Import**
- Use a dashboard ID (e.g. `12778`)
- Select Prometheus as data source

---

## 🧼 Cleanup

```bash
minikube delete
```

---

## 👨‍💻 Author

**Murat Korkmaz**  
GitHub: [muratkorkmaz1](https://github.com/muratkorkmaz1)
