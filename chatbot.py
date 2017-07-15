from chatterbot import ChatBot
import argparse
import sys
from pymongo import MongoClient


url_getResponse = 'mongodb://localhost:27017/'

client = MongoClient(url_getResponse)

db = client['apiDB']
collection = db['botResponse']


userName = sys.argv[1]
token = sys.argv[2]
message = sys.argv[3]



chatbot = ChatBot(
    'ChatBot WEB API',
    trainer='chatterbot.trainers.ChatterBotCorpusTrainer'
)

chatbot.train("chatterbot.corpus.english")


response = chatbot.get_response(message)

obj = {
    "username" : userName,
	"apitoken" : token,
	"query" : message,
	"response" : response.text
}

collection.insert_one(obj)

print("Inserted")