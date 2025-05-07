# Lite Thinking - Business Management Application

This application is a platform for managing companies, products, and inventories, developed with Django (backend) and React (frontend).

## Main Features

- **Authentication**: Login system via email or username with JWT
- **Company Management**: Create, edit and delete companies
- **Product Management**: Manage products by company
- **Inventory Control**: Product stock tracking
- **Role-based Permissions**: Administrator and external user roles with differentiated permissions

## Project Structure

The project is divided into two main parts:

- **Backend**: REST API in Django with the following applications:
  - `users`: User management and authentication
  - `companies`: Company management
  - `products`: Product management
  - `inventories`: Inventory control

- **Frontend**: React user interface

## Requirements

- Docker and Docker Compose
- Git

## Setup and Execution

### Installation with Docker (recommended)

1. Clone the repository:
   ```
   git clone https://github.com/NicolasHurtado/React_Django_Inventory.git
   cd React_Django_Inventor
   ```

2. Run the application with Docker Compose:
   ```
   docker-compose up
   ```

3. The application will be available at:
   - Backend: http://localhost:8000
   - API Docs: http://localhost:8000/api/docs/
   - Admin: http://localhost:8000/admin/

### Access

By default, an administrator user is created with the following credentials:
- Email: admin@example.com
- Password: admin123

## API Endpoints

### Authentication
- `POST /api/token/`: Obtain JWT token (email)
- `POST /api/token/refresh/`: Refresh JWT token

### Users
- `GET /api/users/`: List users (admin only)
- `POST /api/users/`: Create user (admin only)
- `GET /api/users/{id}/`: View user details
- `PUT/PATCH /api/users/{id}/`: Update user
- `DELETE /api/users/{id}/`: Delete user

### Companies
- `GET /api/companies/`: List companies
- `POST /api/companies/`: Create company (admin only)
- `GET /api/companies/{id}/`: View company details
- `PUT/PATCH /api/companies/{id}/`: Update company (admin only)
- `DELETE /api/companies/{id}/`: Delete company (admin only)

### Products
- `GET /api/products/`: List products
- `POST /api/products/`: Create product (admin only)
- `GET /api/products/{id}/`: View product details
- `PUT/PATCH /api/products/{id}/`: Update product (admin only)
- `DELETE /api/products/{id}/`: Delete product (admin only)

### Inventories
- `GET /api/inventories/`: List inventories
- `POST /api/inventories/`: Create inventory (admin only)
- `GET /api/inventories/{id}/`: View inventory details
- `PUT/PATCH /api/inventories/{id}/`: Update inventory (admin only)
- `DELETE /api/inventories/{id}/`: Delete inventory (admin only)

## Development

### Backend
The backend is developed with Django REST Framework and uses PostgreSQL as a database.

#### Folder Structure
```
backend/
├── apps/
│   ├── companies/     # Companies application
│   ├── inventories/   # Inventories application
│   ├── products/      # Products application
│   └── users/         # Users application
├── core/              # Django main configuration
├── conftest.py        # Test configuration
├── Dockerfile         # Docker configuration
├── pyproject.toml     # Poetry configuration
└── requirements.txt   # Dependencies


```
## Code Quality

This project follows development best practices and has tools to maintain code quality, all configured in `pyproject.toml`:

```bash
# Format code with Black
poetry run black .

# Run linting with Flake8
poetry run flake8

# Run type checking with MyPy
poetry run mypy .

# Or use the provided script for all checks
sh lint.sh 
bash lint.sh
```


### Tests

To run the tests:

```bash
# Inside the backend container
docker compose exec backend bash
pytest apps/
```

## Special Features

### Email Authentication
The application allows logging in with both email and username, offering flexibility to users.

### Quality Control
The project uses code quality tools:
- Black for code formatting
- Flake8 for linting
- MyPy for type checking

## 📞 Contact

For any inquiries about the project, contact us at [nicolashurtado0712@gmail.com](mailto:nicolashurtado0712@gmail.com).

---

Developed with ❤️ by Nicolas Hurtado