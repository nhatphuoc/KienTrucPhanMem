// messenger-server/domain/repositories
package repositories

import (
	"context"
	"messenger-server/domain/entities"
)

type FriendRepository interface {
	GetFriends(ctx context.Context, userEmail string) ([]entities.User, error)
	SendFriendRequest(ctx context.Context, userEmail, friendEmail string) error
	CheckFriendship(ctx context.Context, userEmail, friendEmail string) (bool, error)
}
