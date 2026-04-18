# Dockerfile for LaTeX compilation with custom fonts
FROM blang/latex:ctanfull

# Install required packages for font handling
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    fontconfig \
    && rm -rf /var/lib/apt/lists/*

# Create directories for fonts and class files
RUN mkdir -p /usr/share/fonts/truetype/lato \
    /usr/share/fonts/truetype/raleway \
    /usr/local/texlive/texmf-local/tex/latex/deedy

# Set working directory for copying files
WORKDIR /tmp

# Copy font files and class file
COPY backend/templates/fonts/lato/*.ttf /usr/share/fonts/truetype/lato/
COPY backend/templates/fonts/raleway/*.otf /usr/share/fonts/truetype/raleway/
COPY backend/templates/deedy-reversed-resume.cls /usr/local/texlive/texmf-local/tex/latex/deedy/deedy-resume-reversed.cls

# Create symbolic links for fonts in the expected location
RUN mkdir -p /data/fonts/lato /data/fonts/raleway
RUN ln -s /usr/share/fonts/truetype/lato/* /data/fonts/lato/
RUN ln -s /usr/share/fonts/truetype/raleway/* /data/fonts/raleway/

# Update font cache and TeX database
RUN fc-cache -f -v && mktexlsr

# Set working directory for LaTeX compilation
WORKDIR /data

# The container will be used with volume mounting
# No need to COPY LaTeX files into the image
