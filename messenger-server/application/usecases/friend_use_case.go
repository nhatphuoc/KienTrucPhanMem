// File: messenger-server/application/usecases/friend_use_case.go
package usecases

import (
	"context"
	"errors"
	"messenger-server/domain/entities"
	"messenger-server/domain/repositories"
)

type FriendUseCase struct {
	FriendRepo repositories.FriendRepository
}

func NewFriendUseCase(friendRepo repositories.FriendRepository) *FriendUseCase {
	return &FriendUseCase{FriendRepo: friendRepo}
}

func (uc *FriendUseCase) GetFriends(ctx context.Context, userEmail string) ([]entities.User, error) {
	return uc.FriendRepo.GetFriends(ctx, userEmail)
}

func (uc *FriendUseCase) SendFriendRequest(ctx context.Context, userEmail, friendEmail string) error {
	if userEmail == friendEmail {
		return errors.New("cannot send friend request to self")
	}
	return uc.FriendRepo.SendFriendRequest(ctx, userEmail, friendEmail)
}

func (uc *FriendUseCase) CheckFriendship(ctx context.Context, userEmail, friendEmail string) (bool, error) {
	friends, err := uc.FriendRepo.GetFriends(ctx, userEmail)
	if err != nil {
		return false, err
	}
	for _, friend := range friends {
		if friend.Email == friendEmail {
			return true, nil
		}
	}
	return false, nil
}
