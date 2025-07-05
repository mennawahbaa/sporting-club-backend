# Blue Ribbon Sporting Club Management API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

A NestJS-based backend application for managing a sporting club with REST API endpoints for members, sports, and sport subscriptions. Built with PostgreSQL using Supabase as the database provider.

## 🏆 Project Overview

This application provides a comprehensive API for managing:
- **Members**: Club members with personal information and family relationships
- **Sports**: Available sports with pricing and gender restrictions
- **Subscriptions**: Member subscriptions to sports (group or private)

## 📋 Requirements

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project
- PostgreSQL database (via Supabase)

## 🚀 Project Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd sporting-club-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration (Supabase)
DATABASE_URL=postgresql://[username]:[password]@[host]:[port]/[database]
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key

# Application Configuration
PORT=3000
NODE_ENV=development
```

### 4. Database Setup
The application uses Supabase PostgreSQL. Ensure your database schema includes:
- Members table with family relationships
- Sports table with pricing and gender restrictions
- Subscriptions table linking members to sports

### 5. Run Database Migrations
```bash
npm run migration:run
```

### 6. Start the Application

#### Development Mode
```bash
npm run start:dev
```

#### Production Mode
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## 📚 API Summary

### 🏃‍♂️ Sports Management

| Method | Endpoint | Description | Features |
|--------|----------|-------------|----------|
| POST | `/sports` | Create a new sport | Validation, gender restrictions |
| GET | `/sports` | Get all sports | **Optimized for mobile app** (cached, efficient) |
| PATCH | `/sports/:id` | Update a sport | Full sport information update |
| DELETE | `/sports/:id` | Delete a sport | Cascade handling |

### 👥 Member Management

| Method | Endpoint | Description | Features |
|--------|----------|-------------|----------|
| POST | `/members` | Create a new member | Family relationship support |
| GET | `/members/:id` | Get member details | Complete member profile |
| PATCH | `/members/:id` | Update member information | Personal data updates, family head reassignment with circular dependency prevention |
| DELETE | `/members/:id` | Delete a member | Smart cascade delete: root members promote children to roots, members with head & children reassign children to grandparent |

### 🎯 Subscription Management

| Method | Endpoint | Description | Features |
|--------|----------|-------------|----------|
| POST | `/subscriptions` | Subscribe member to sport | **Duplicate prevention**, type selection |
| DELETE | `/subscriptions/:id` | Unsubscribe member from sport | Clean removal |

## 📊 Data Models

### Member
- **Personal Info**: First name, last name, gender (male/female), birthdate
- **Membership**: Subscription date
- **Family**: Optional family member relationships (1:many)

### Sport
- **Basic Info**: Name, subscription price
- **Restrictions**: Allowed gender (male, female, mix)

### Subscription
- **Relationship**: Links member to sport
- **Type**: Group or private subscription
- **Uniqueness**: One subscription per member per sport

## 🔧 Key Features & Optimizations

### High-Performance Sports Endpoint
The `/sports` endpoint is optimized for mobile app usage with:
- Database query optimization
- Response caching
- Efficient data serialization
- Minimal payload size

### Subscription Integrity
- **Duplicate Prevention**: Members cannot have multiple subscriptions to the same sport
- **Gender Validation**: Subscriptions respect sport gender restrictions
- **Graceful Gender Updates**: When updating sport gender restrictions, existing subscriptions that violate the new rules are preserved (they must end naturally), but new subscriptions are prevented
- **Type Management**: Clear distinction between group and private subscriptions

### Family Relationships
- Members can have associated family members
- Each family member is linked to exactly one central member (familyHead)
- **Smart Cascade Delete Operations**:
  - **Root Member Deletion**: When deleting a member with no familyHead (root), all its children become independent roots (familyHead = null)
  - **Member with Head & Children**: When deleting a member that has both a familyHead and children, all children are reassigned to the deleted member's familyHead
- **Circular Dependency Prevention**: Family head updates are validated to prevent circular relationships
- Cascade operations handle family relationship integrity

## 🧪 Testing

### Run All Tests
```bash
npm run test
```

### Unit Tests
```bash
npm run test:unit
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 🛡️ Input Validation

The application implements comprehensive input validation using:
- **DTOs (Data Transfer Objects)** for request structure
- **class-validator** for field validation
- **Joi schemas** for complex validation rules

## 🗃️ Database Operations

### Efficient Database Handling
- Connection pooling for optimal performance
- Optimized queries for frequently accessed data
- Proper indexing strategy
- Transaction management for data consistency

### Supabase Integration
- Real-time capabilities ready
- Built-in authentication hooks
- Row Level Security (RLS) compatible
- Automatic API generation

## 🚀 Deployment

### Local Development
```bash
npm run start:dev
```

### Production Build
```bash
npm run build
npm run start:prod
```

## 📝 Development Assumptions

1. **Gender Restrictions**: Only "male", "female", and "mix" are valid sport gender restrictions
2. **Family Relationships**: Family members are dependent on central members with intelligent cascade logic
3. **Subscription Uniqueness**: Enforced at database level with unique constraints
4. **Soft Delete**: Members are soft-deleted to maintain historical subscription data
5. **Price Format**: Sport prices are stored as decimal values in the database

## 🔄 Advanced Business Logic

### Family Management Rules
- **Root Member Deletion (No familyHead)**: 
  - All children become independent root members
  - Children's familyHead field is set to null
  - No orphaned family members are created

- **Member with Head & Children Deletion**:
  - All children are reassigned to the deleted member's familyHead
  - Maintains family hierarchy integrity
  - Prevents broken family chains

- **Family Head Updates**:
  - Circular dependency validation prevents A → B → A relationships
  - System validates the entire family tree before allowing updates
  - Prevents infinite loops in family relationships

### Sport Gender Management
- **Gender Restriction Updates**:
  - Existing subscriptions that violate new gender rules are NOT deleted
  - Violating subscriptions are allowed to continue until they naturally end
  - New subscriptions are prevented if they violate current gender restrictions
  - This prevents data loss and maintains business continuity

## 🤝 Code Quality

- **ESLint**: Code linting and formatting
- **Prettier**: Consistent code style
- **TypeScript**: Type safety throughout
- **Unit Tests**: Comprehensive test coverage
- **Documentation**: Clear API documentation

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection**: Verify Supabase credentials in `.env`
2. **Port Conflicts**: Change PORT in `.env` if 3000 is occupied
3. **Migration Errors**: Ensure database schema matches application models

### Support Resources
- NestJS Documentation: https://docs.nestjs.com
- Supabase Documentation: https://supabase.com/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/

## 📞 Contact

For questions about this implementation, please contact the development team or refer to the project documentation.

---

**Built with ❤️ using NestJS and Supabase**