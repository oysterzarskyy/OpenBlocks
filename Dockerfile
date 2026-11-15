FROM rust:1-bookworm AS builder

RUN apt-get update \
	&& apt-get install --no-install-recommends -y mingw-w64 \
	&& rm -rf /var/lib/apt/lists/*

RUN rustup target add x86_64-pc-windows-gnu

WORKDIR /workspace
COPY Cargo.toml Cargo.lock ./
RUN cargo fetch --locked

COPY src ./src

ENV CARGO_TARGET_X86_64_PC_WINDOWS_GNU_LINKER=x86_64-w64-mingw32-gcc
RUN cargo build --locked --release --target x86_64-pc-windows-gnu --bin openblocks

FROM scratch AS windows-artifact
COPY --from=builder /workspace/target/x86_64-pc-windows-gnu/release/openblocks.exe /openblocks.exe
