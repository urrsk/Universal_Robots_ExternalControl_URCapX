import flask
from flask import Flask, jsonify
from flask_cors import CORS
import request_program
import socket
import time

command = "request_program\n"

# Create a simple rest api with Flask (https://flask.palletsprojects.com/en/2.0.x/)
app = Flask(__name__)
CORS(app)

# Simple in-memory cache: {(port, robotIP): (timestamp, program)}
program_cache = {}
CACHE_TTL = 2  # seconds

def split_program_sections(program_text):
    preamble = ''
    program_node = ''
    header_start = '# HEADER_BEGIN'
    header_end = '# HEADER_END'
    start_idx = program_text.find(header_start)
    end_idx = program_text.find(header_end)
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        end_idx += len(header_end)
        preamble = program_text[start_idx:end_idx]
        # Everything after header_end is the program node
        program_node = program_text[end_idx:].lstrip('\n')
    else:
        # If no header, treat all as program_node
        program_node = program_text
    return preamble, program_node

def get_cached_response(cache_key, now):
    if cache_key in program_cache:
        ts, json_str = program_cache[cache_key]
        if now - ts < CACHE_TTL:
            return flask.Response(json_str, mimetype='application/json')
    return None

def build_json_response(program, valid, status_text):
    preamble, program_node = split_program_sections(program)
    json_obj = {
        "preamble": preamble,
        "program_node": program_node,
        "valid": valid,
        "status": status_text
    }
    return flask.json.dumps(json_obj)

def store_in_cache(cache_key, now, json_str, valid):
    if valid:
        program_cache[cache_key] = (now, json_str)

@app.route('/<int:port>/<robotIP>/', methods=["GET"])
def read_params(port, robotIP):
    cache_key = (port, robotIP)
    now = time.time()
    cached_resp = get_cached_response(cache_key, now)
    if cached_resp:
        return cached_resp
    status = None
    try:
        con = request_program.RequestProgram(port, robotIP)
        program = con.send_command(command)
        valid = bool(program and program.strip())
        status = "ok"
    except Exception as e:
        program = ''
        valid = False
        status = str(e)
    json_str = build_json_response(program, valid, status)
    store_in_cache(cache_key, now, json_str, valid)
    return flask.Response(json_str, mimetype='application/json')
