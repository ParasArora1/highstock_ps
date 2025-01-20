from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from dataclasses import dataclass
from datetime import datetime, timezone
import os
from supabase import create_client, Client
from http import HTTPStatus
import threading

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": "http://pizzaparadisehs.netlify.app",  
        "allow_headers": ["Content-Type"],
        "methods": ["GET", "POST", "OPTIONS,DELETE"],
        "supports_credentials": True
    }
})

socketio = SocketIO(app, cors_allowed_origins="http://pizzaparadisehs.netlify.app")

url = "https://zllmedoapyxuerctyfwl.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbG1lZG9hcHl4dWVyY3R5ZndsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzA0ODQ0NSwiZXhwIjoyMDUyNjI0NDQ1fQ.E79VF3e8iPApqObEKuJrZQWozc8ZCSDEKzeSbQRj3dg"

supabase: Client = create_client(url, key)

connected_clients = []


@dataclass
class User:
    name: str
    age: int
    gender: str
    coins: int = 100

class APIError(Exception):
    def __init__(self, message: str, status_code: int):
        super().__init__(message)
        self.status_code = status_code


@app.errorhandler(APIError)
def handle_api_error(error):
    response = jsonify({'error': str(error)})
    response.status_code = error.status_code
    return response


@app.route('/users', methods=['GET'])
def get_users():
    """Retrieve all users and their pizza purchase history."""
    try:
        response = supabase.table('users').select('*').order('name').execute()
        # print(response)
        for user in response.data:
            history_response = supabase.table('user_slices') \
                .select('slice_id, purchased_at, pizza_slices(name)') \
                .eq('user_id', user['id']) \
                .execute()
            user['history'] = [
                {'sliceName': item['pizza_slices']['name'], 'timestamp': item['purchased_at']}
                for item in history_response.data
            ]
        return jsonify(response.data)
    except Exception as e:
        raise APIError(f"Failed to retrieve users: {str(e)}", HTTPStatus.INTERNAL_SERVER_ERROR)


@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id: int):
    """Delete a user by ID."""
    try:
        response = supabase.table('users').delete().eq('id', user_id).execute()
        if not response.data:
            raise APIError("User not found", HTTPStatus.NOT_FOUND)
        return '', HTTPStatus.NO_CONTENT
    except Exception as e:
        raise APIError(f"Failed to delete user: {str(e)}", HTTPStatus.INTERNAL_SERVER_ERROR)


@app.route('/users', methods=['POST'])
def create_user():
    """Create a new user."""
    try:
        data = request.json
        user = User(
            name=data['name'],
            age=data['age'],
            gender=data['gender']
        )
        response = supabase.table('users').insert(vars(user)).execute()
        # print("step1")
        handle_some_event("send to client")
        # print("step2")
        return jsonify(response.data[0]), HTTPStatus.CREATED
    except KeyError as e:
        raise APIError(f"Missing required field: {str(e)}", HTTPStatus.BAD_REQUEST)
    except Exception as e:
        raise APIError(f"Failed to create user: {str(e)}", HTTPStatus.INTERNAL_SERVER_ERROR)


@app.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Retrieve the leaderboard based on pizza consumption."""
    try:
        response = supabase.table('users').select('name, number_of_pizza_eaten').gt('number_of_pizza_eaten', 0).order('number_of_pizza_eaten', desc=True).order('name').execute()
        # print(response)
        leaderboard = []
        rank = 1
        for user in response.data:
            user_with_rank = user.copy()  
            user_with_rank['rank'] = rank  
            leaderboard.append(user_with_rank)
            rank += 1 
        return jsonify(leaderboard), HTTPStatus.OK
    except Exception as e:
        raise APIError(f"Failed to retrieve leaderboard: {str(e)}", HTTPStatus.INTERNAL_SERVER_ERROR)


@app.route('/pizza_slices', methods=['GET'])
def get_pizza_slices():
    """Retrieve all available pizza slices."""
    try:
        response = supabase.table('pizza_slices').select('*').execute()
        return jsonify(response.data), HTTPStatus.OK
    except Exception as e:
        raise APIError(f"Failed to retrieve pizza slices: {str(e)}", HTTPStatus.INTERNAL_SERVER_ERROR)


@app.route('/buy_pizza', methods=['POST'])
def buy_pizza():
    """Process pizza purchases."""
    try:
        data = request.json
        user_id = data['user_id']
        items = data['items']  # List of {slice_id, quantity}

        user = supabase.table('users').select('*').eq('id', user_id).single().execute()
        if not user.data:
            raise APIError("User not found", HTTPStatus.NOT_FOUND)

        total_cost = sum(
            supabase.table('pizza_slices').select('*').eq('id', item['slice_id']).single().execute().data['price'] * item['quantity']
            for item in items
        )

        if user.data['coins'] < total_cost:
            raise APIError("Not enough coins", HTTPStatus.BAD_REQUEST)

        supabase.table('users').update({'coins': user.data['coins'] - total_cost}).eq('id', user_id).execute()
        for item in items:
            for _ in range(item['quantity']):
                supabase.table('user_slices').insert({
                    'user_id': user_id,
                    'slice_id': item['slice_id'],
                    'purchased_at': datetime.utcnow().isoformat()
                }).execute()

        return jsonify({'message': 'Purchase successful'}), HTTPStatus.CREATED
    except KeyError as e:
        raise APIError(f"Missing required field: {str(e)}", HTTPStatus.BAD_REQUEST)
    except Exception as e:
        raise APIError(f"Failed to process purchase: {str(e)}", HTTPStatus.INTERNAL_SERVER_ERROR)


@app.route('/user_history/<int:user_id>', methods=['GET'])
def get_user_history(user_id):
    """Retrieve a user's pizza purchase history."""
    try:
        user_purchases = supabase.table('user_slices') \
            .select('id, slice_id, purchased_at, eaten_at, pizza_slices(name)') \
            .eq('user_id', user_id) \
            .execute()
        history = [
            {
                "id": item['id'],
                "sliceName": item['pizza_slices']['name'],
                "purchased_at": item['purchased_at'],
                "eaten_at": item['eaten_at']
            }
            for item in user_purchases.data
        ]
        return jsonify(history)
    except Exception as e:
        raise APIError(f"Failed to fetch user history: {str(e)}", HTTPStatus.INTERNAL_SERVER_ERROR)


@app.route('/log_pizza', methods=['POST'])
def log_pizza():
    """Log a pizza slice as eaten."""
    try:
        data = request.json
        id = int(data['id'])
        user_id = int(data['user_id'])

        slice_query = supabase.table('user_slices').select('*').eq('id', id).is_('eaten_at', None).single().execute()
        if not slice_query.data:
            raise APIError(f"No uneaten slice found with slice id {id}", HTTPStatus.BAD_REQUEST)
        current_time = datetime.now(timezone.utc).isoformat()
        supabase.table('user_slices').update({'eaten_at': current_time}).eq('id', slice_query.data['id']).execute()

        user_data = supabase.table('users').select('number_of_pizza_eaten').eq('id', user_id).execute()
        if user_data.data:
           current_pizza_count = user_data.data[0]['number_of_pizza_eaten']
        new_pizza_count = current_pizza_count + 1
        supabase.table('users').update({'number_of_pizza_eaten': new_pizza_count}).eq('id', user_id).execute()
        handle_some_event("send to client")
       
        return jsonify({'message': 'Pizza slice logged as eaten!'}), HTTPStatus.OK
    except Exception as e:
        raise APIError(f"Failed to log pizza: {str(e)}", HTTPStatus.INTERNAL_SERVER_ERROR)



@socketio.on('response')
def handle_some_event(data):
    try:
        emit('response', {'message': 'update_leaderboard'}, namespace='/',broadcast=True)
        # print("Emitted 'response' event with message to all clients")
    except Exception as e:
        print(f"Error during event emission: {e}")
        return jsonify({"status": "failure", "error": str(e)}), 500
    return jsonify({"status": "success"}), 200  # Return a proper response

@socketio.on_error()
def error_handler(e):
    print(f"Error: {e}")
    emit('error', {'message': 'An error occurred'})

@socketio.on('message')
def handle_message(data):
    """Handle WebSocket messages."""
    if data == 'update':
        emit('response', {'message': 'Leaderboard updated'})
    else:
        emit('response', {'message': 'Unknown message received'})


@socketio.on_error()
def error_handler(e):
    print(f"Error: {e}")
    emit('error', {'message': 'An error occurred'})


def notify_clients():
    """Notify all connected WebSocket clients of updates."""
    for client in connected_clients:
        try:
            client.send("update")
            # print("Update leader board sent")
        except:
            connected_clients.remove(client)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)
