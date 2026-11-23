FROM python:slim@sha256:65a65fc7b30b06cb6df4930fd4650697cb23f4c2698ab81fc87e4b031bc36928
WORKDIR /code
ENTRYPOINT ["sh", "-c", "if [ -n \"$INSTALL_DEPS\" ]; then eval \"$INSTALL_DEPS\"; fi && python search.py"]
