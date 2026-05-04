import socketio
from fastapi import APIRouter

# Create an Async Server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

# Socket.io ASGI App
sio_app = socketio.ASGIApp(sio)

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def join_room(sid, data):
    room = data.get('room')
    if room:
        await sio.enter_room(sid, room)
        print(f"Client {sid} joined room: {room}")
        await sio.emit('user_joined', {'sid': sid}, room=room, skip_sid=sid)

@sio.event
async def signal(sid, data):
    room = data.get('room')
    if room:
        # Forward the signaling data om(offer, answer, or candidate) to everyone else in the ro
        await sio.emit('signal', data, room=room, skip_sid=sid)

@sio.event
async def leave_room(sid, data):
    room = data.get('room')
    if room:
        await sio.leave_room(sid, room)
        print(f"Client {sid} left room: {room}")
