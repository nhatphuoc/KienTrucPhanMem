// File: messenger-server/infrastructure/repository/friend_repository.go
package repository

import (
	"context"
	"time"

	"messenger-server/domain/entities"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type FriendMongoRepository struct {
	Collection *mongo.Collection
}

func NewFriendMongoRepository(db *mongo.Database) *FriendMongoRepository {
	return &FriendMongoRepository{Collection: db.Collection("friends")}
}

func (r *FriendMongoRepository) GetFriends(ctx context.Context, userEmail string) ([]entities.User, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	// Lấy tất cả người dùng từ collection users, trừ người dùng hiện tại
	userCollection := r.Collection.Database().Collection("users")
	filter := bson.M{"email": bson.M{"$ne": userEmail}} // Loại trừ userEmail
	cursor, err := userCollection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var users []entities.User
	if err = cursor.All(ctx, &users); err != nil {
		return nil, err
	}

	return users, nil
}

func (r *FriendMongoRepository) SendFriendRequest(ctx context.Context, userEmail, friendEmail string) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.Collection.InsertOne(ctx, bson.M{
		"userEmail":   userEmail,
		"friendEmail": friendEmail,
		"status":      "pending",
		"createdAt":   time.Now(),
	})
	return err
}

func (r *FriendMongoRepository) CheckFriendship(ctx context.Context, userEmail, friendEmail string) (bool, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	filter := bson.M{
		"$or": []bson.M{
			{"userEmail": userEmail, "friendEmail": friendEmail, "status": "accepted"},
			{"userEmail": friendEmail, "friendEmail": userEmail, "status": "accepted"},
		},
	}
	count, err := r.Collection.CountDocuments(ctx, filter)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
