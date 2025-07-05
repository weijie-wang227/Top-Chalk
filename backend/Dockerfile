# syntax=docker/dockerfile:1

FROM golang:1.24

RUN mkdir /app

WORKDIR /app

COPY go.mod go.sum /app/

RUN go mod download

COPY . /app/

EXPOSE 8080

RUN go build -o main cmd/project/main.go

CMD ["./main"]
