import os
import unittest
from types import SimpleNamespace
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
import app
import agent

class SecureConfigurationTests(unittest.TestCase):
    def test_browser_cannot_replace_key(self):
        with TestClient(app.app) as client, patch('agent._find_api_key', return_value='private-test-value'):
            self.assertIn(client.post('/api/key', json={'key':'replacement'}).status_code, (404,405))
            self.assertNotIn('private-test-value', client.get('/api/status').text)
            self.assertNotIn('api-key-input', client.get('/study').text)

    def test_cross_origin_generation_rejected(self):
        with TestClient(app.app) as client:
            response=client.post('/api/learn',json={'text':'a'*40},headers={'Origin':'https://unrelated.example'})
            self.assertEqual(response.status_code,403)

    def test_bedrock_uses_configured_model_and_schema(self):
        import boto3
        fake=MagicMock()
        fake.converse.return_value={'stopReason':'end_turn','output':{'message':{'content':[{'text':'{}'}]}}}
        with patch.dict(os.environ,{'PAGEBHASHA_AI_PROVIDER':'bedrock','PAGEBHASHA_MODEL_ID':'test-model'}),patch.object(boto3,'client',return_value=fake):
            result=agent._bedrock_response('A textbook source',None,'Hindi exam notes',True)
        self.assertEqual(result.text,'{}')
        kwargs=fake.converse.call_args.kwargs
        self.assertEqual(kwargs['modelId'],'test-model')
        self.assertIn('schema',kwargs['system'][0]['text'])

    def test_secret_is_server_only(self):
        import boto3
        fake=MagicMock()
        fake.get_secret_value.return_value={'SecretString':'{"GEMINI_API_KEY":"server-only"}'}
        agent._secret_key.cache_clear()
        with patch.dict(os.environ,{'PAGEBHASHA_GEMINI_SECRET_ARN':'test-secret'}),patch.object(boto3,'client',return_value=fake):
            self.assertEqual(agent._find_api_key(),'server-only')
            self.assertNotIn('server-only',str(agent.settings()))
        agent._secret_key.cache_clear()

if __name__=='__main__': unittest.main()
