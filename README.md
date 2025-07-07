# Kafka-Mongo NodeJS Observability Pipeline

Bu proje, Kafka ile üretilen mesajların bir Node.js consumer aracılığıyla MongoDB'ye yazılmasını, CI/CD sürecinin GitHub Actions ile yönetilmesini ve sistemin ArgoCD + Prometheus + Grafana kullanılarak izlenmesini sağlar.

---

## 🔧 Proje Bileşenleri

- **Producer:** HTTP üzerinden gelen mesajları Kafka'ya publish eder.
- **Consumer:** Kafka'dan gelen mesajları dinler ve MongoDB'ye yazar.
- **Kafka, MongoDB:** Docker üzerinde external olarak çalışır.
- **Kubernetes:** Minikube üzerinde Helm + ArgoCD ile deployment yapılır.
- **Monitoring:** Prometheus + Grafana + node-exporter ile metrik takibi.
- **CI/CD:** GitHub Actions ile Docker image build/push + ArgoCD sync işlemleri.

---

## 🚀 Kurulum Adımları

### 1. Docker Servislerini Başlat

```bash
docker-compose up -d
```

### 2. Minikube Başlat

```bash
minikube start
```

### 3. ArgoCD Kurulumu

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### 4. ArgoCD UI Erişimi

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Tarayıcıda aç: [https://localhost:8080](https://localhost:8080)

İlk şifre:

```bash
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 --decode
```

---

## 📦 Deployment

### 1. Helm Chart Yapısı

```text
chart/
├── consumer/
├── producer/
├── templates/
└── values.yaml
```

### 2. Uygulamaları Deploy Etmek için ArgoCD App Tanımı

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: producer
spec:
  source:
    repoURL: https://github.com/<username>/kafka-mongo-nodejs
    path: chart/producer
    targetRevision: HEAD
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  project: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

---

## ✅ Test

```bash
curl -X POST http://localhost:3000/submit   -H "Content-Type: application/json"   -d '{"value": "hello kafka"}'
```

MongoDB üzerinde kontrol:

```bash
docker exec -it kafka-mongo-nodejs-mongodb-1 mongosh
use kafka_logs
db.logs.find().pretty()
```

---

## 📊 Monitoring

### 1. Prometheus ve Grafana Kurulumu

```bash
kubectl create namespace monitoring
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring
helm install grafana grafana/grafana -n monitoring
```

### 2. Grafana Admin Şifresi Öğrenme

```bash
kubectl get secret grafana-admin -n monitoring -o jsonpath="{.data.GF_SECURITY_ADMIN_PASSWORD}" | base64 --decode
```

Kullanıcı: `admin`

---

### 3. Grafana UI Erişimi (Minikube Tunnel ile)

#### a. Servis tipini LoadBalancer yap:

```bash
kubectl patch svc grafana -n monitoring -p '{"spec": {"type": "LoadBalancer"}}'
```

#### b. Minikube tunnel başlat:

```bash
minikube tunnel
```

#### c. IP ve port bilgilerini kontrol et:

```bash
kubectl get svc -n monitoring grafana
```

#### d. Tarayıcıdan eriş:

```text
http://127.0.0.1:3000
```

---

## 🔁 CI/CD Süreci

GitHub Actions pipeline `.github/workflows/deploy.yml` dosyasıyla tetiklenir:

- Docker image build + push (consumer & producer)
- ArgoCD App sync işlemi
- Tüm secrets GitHub üzerinden tanımlanır (`DOCKERHUB_USERNAME`, `DOCKERHUB_PASSWORD` vs.)

---

## 🔐 Kullanılan GitHub Secrets

| Name               | Açıklama                         |
|--------------------|----------------------------------|
| `DOCKERHUB_USERNAME` | Docker Hub kullanıcı adı         |
| `DOCKERHUB_PASSWORD` | Docker Hub erişim token'ı        |
| `ARGOCD_SERVER`      | ArgoCD API endpoint              |
| `ARGOCD_AUTH_TOKEN`  | ArgoCD erişim token'ı            |

---

## 🗺️ Topoloji

```
[user] → [producer: Node.js] → [Kafka (Docker)] → [consumer: Node.js] → [MongoDB (Docker)]
                                                     ↘                         ↙
                                                    [Prometheus + Grafana Monitoring]
```

---

Tüm sistem Minikube üzerinde Helm + ArgoCD ile yönetilir, dış servislerle (Kafka, Mongo) Docker üzerinden haberleşir.