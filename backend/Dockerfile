FROM golang:1.20 as builder

WORKDIR /app
# First copy only module files
COPY go.mod go.sum ./
# Download dependencies
RUN go mod download
# Copy everything else
COPY . .
# Build with module support
RUN CGO_ENABLED=0 GOOS=linux go build -mod=readonly -o main .

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8000
CMD ["./main"]
