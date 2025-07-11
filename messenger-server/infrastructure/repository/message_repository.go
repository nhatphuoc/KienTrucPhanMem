// messenger-server/infrastructure/repository/message_repository.go
package repository

import (
	"context"
	"messenger-server/domain/entities"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type MessageMongoRepository struct {
	Collection *mongo.Collection
}

func NewMessageMongoRepository(db *mongo.Database) *MessageMongoRepository {
	return &MessageMongoRepository{
		Collection: db.Collection("messages"),
	}
}

func (r *MessageMongoRepository) SaveMessage(ctx context.Context, msg entities.Message) error {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := r.Collection.InsertOne(ctx, msg)
	return err
}

func (r *MessageMongoRepository) GetMessages(ctx context.Context, senderEmail, receiverEmail string) ([]entities.Message, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	filter := bson.M{
		"$or": []bson.M{
			{"senderEmail": senderEmail, "receiverEmail": receiverEmail},
			{"senderEmail": receiverEmail, "receiverEmail": senderEmail},
		},
	}
	cursor, err := r.Collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}

	var messages []entities.Message
	if err = cursor.All(ctx, &messages); err != nil {
		return nil, err
	}
	return messages, nil
}
