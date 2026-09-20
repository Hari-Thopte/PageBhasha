FROM public.ecr.aws/lambda/python:3.13


# Install Python dependencies
COPY requirements.txt ${LAMBDA_TASK_ROOT}/
RUN pip install --no-cache-dir -r ${LAMBDA_TASK_ROOT}/requirements.txt

# Copy application code
COPY app.py agent.py pdf_source.py lambda_handler.py ${LAMBDA_TASK_ROOT}/

# Mangum handler as Lambda entry point
CMD ["lambda_handler.handler"]
