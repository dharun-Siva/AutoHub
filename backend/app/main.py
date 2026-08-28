from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title='AutoHub API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.get('/api/health')
def health_check():
    return {'status': 'ok', 'service': 'AutoHub API'}

@app.get('/api/listings')
def get_listings():
    return {
        'listings': [
            {
                'id': 1,
                'title': '2022 Toyota Camry',
                'type': 'Car',
                'price': 24500,
                'location': 'Bangalore',
                'year': 2022,
                'mileage': '28k km',
                'fuel': 'Hybrid',
                'condition': 'Certified'
            },
            {
                'id': 2,
                'title': '2021 Royal Enfield Classic 350',
                'type': 'Bike',
                'price': 185000,
                'location': 'Hyderabad',
                'year': 2021,
                'mileage': '14k km',
                'fuel': 'Petrol',
                'condition': 'Excellent'
            },
            {
                'id': 3,
                'title': '2023 Mahindra Bolero',
                'type': 'SUV',
                'price': 980000,
                'location': 'Pune',
                'year': 2023,
                'mileage': '22k km',
                'fuel': 'Diesel',
                'condition': 'Verified'
            }
        ]
    }
