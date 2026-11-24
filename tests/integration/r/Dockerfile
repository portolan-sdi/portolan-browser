FROM rocker/r-ver:latest@sha256:4383092318935c298533466f753354a7dfdc75a6e12edfb93a0f13c8a97135f9
# Use the -dev packages instead of versioned runtime libraries (e.g. libgdal34),
# so the image doesn't break when rocker/r-ver:latest moves to a newer Ubuntu release.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libudunits2-dev \
    libproj-dev \
    libgdal-dev \
    libgeos-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /code
ENTRYPOINT ["sh", "-c", "if [ -n \"$INSTALL_DEPS\" ]; then eval \"$INSTALL_DEPS\"; fi && Rscript search.R"]
