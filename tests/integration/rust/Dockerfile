FROM rust:slim@sha256:6f14b2b4b278ec0d50aa1d69541c304ce0f95e0f6268487aa9924af1c2e9aebe
RUN apt-get update \
    && apt-get install -y --no-install-recommends pkg-config libssl-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY Cargo.toml .
# Pre-compile dependencies with a dummy main so real builds are fast
RUN mkdir src && echo 'fn main() {}' > src/main.rs && cargo build --release && rm src/main.rs
ENTRYPOINT ["sh", "-c", "if [ -z \"$INSTALL_DEPS\" ]; then echo 'INSTALL_DEPS is required for Rust integration tests.' >&2; exit 1; fi && cp /code/main.rs src/main.rs && eval \"$INSTALL_DEPS\" && cargo build --release && ./target/release/stac-search"]
