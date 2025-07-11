
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

### 3. External Kafka ve Mongo IP'lerini Öğren

```bash
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' kafka-mongo-nodejs-kafka-1
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' kafka-mongo-nodejs-mongodb-1
```

> Bu IP’leri `producer/.env`, `consumer/.env` ve `values.yaml` dosyalarında uygun şekilde güncelleyin.

---

## 🎯 Helm Deploy

```bash
kubectl create namespace kafka-mongo

helm upgrade --install producer ./chart/producer -n kafka-mongo -f chart/producer/values.yaml
helm upgrade --install consumer ./chart/consumer -n kafka-mongo -f chart/consumer/values.yaml
```

---

## 🚢 ArgoCD Kurulumu

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

### ArgoCD UI Erişimi

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Tarayıcıda aç: [https://localhost:8080](https://localhost:8080)

İlk şifre:

```bash
kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 --decode
```

---

## 📦 ArgoCD ile Uygulama Deploy

`producer.yaml` ve `consumer.yaml` dosyalarıyla ArgoCD üzerinden otomatik senkronizasyon sağlanır.

```bash
kubectl apply -f producer.yaml -n argocd
kubectl apply -f consumer.yaml -n argocd
```

---

## ✅ Test

Producer pod'una port yönlendirme yap:

```bash
kubectl port-forward -n kafka-mongo service/producer 3000:3000
```

Ardından:

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

## 📊 Monitoring (Prometheus + Grafana)

### 1. Kurulum

```bash
kubectl create namespace monitoring

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring
helm install grafana grafana/grafana -n monitoring
```

### 2. Grafana Admin Şifresi

```bash
kubectl get secret grafana -n monitoring -o jsonpath="{.data.admin-password}" | base64 --decode
```

Kullanıcı: `admin`

---

### 3. Grafana UI Erişimi

```bash
kubectl --namespace monitoring port-forward svc/grafana 3001:80
```

Tarayıcıda aç: [http://localhost:3001](http://localhost:3001)

---

## 🔁 CI/CD Süreci

GitHub Actions pipeline `.github/workflows/deploy.yml` dosyasıyla tetiklenir:

- Docker image build + push (consumer & producer)
- ArgoCD App sync işlemi
- Tüm secrets GitHub üzerinden tanımlanır (`DOCKERHUB_USERNAME`, `DOCKERHUB_PASSWORD` vs.)

---

## 🔐 Kullanılan GitHub Secrets

| Name                 | Açıklama                         |
|----------------------|----------------------------------|
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

Tüm sistem Minikube üzerinde Helm + ArgoCD ile yönetilir, dış servislerle (Kafka, Mongo) Docker üzerinden haberleşir.
