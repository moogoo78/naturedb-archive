ARG PYTHON_VERSION=3.10

FROM python:${PYTHON_VERSION}-slim-buster AS builder

RUN apt-get update \
  && apt-get install -y build-essential \
  && apt-get purge -y --auto-remove \
  && rm -fr /var/lib/apt/lists/*
  #psycopg2
  #&& apt-get install -y

#RUN apt-get install xx

WORKDIR /code


#COPY --from=node
#flask static
COPY requirements requirements
RUN pip install --no-cache --user -r requirements/prod.txt

#ENTRYPOINT ["python"]
#CMD ["app.py"]

COPY ./scripts/entrypoint /srv/entrypoint
RUN sed -i 's/\r$//g' /srv/entrypoint
RUN chmod +x /srv/entrypoint

COPY ./scripts/start /srv/start
RUN sed -i 's/\r$//g' /srv/start
RUN chmod +x /srv/start

ENV FLASK_APP=run.py
ENV FLASK_DEBUG=1
ENV FLASK_ENV=development
CMD ["/root/.local/bin/flask", "run", "--host", "0.0.0.0"]