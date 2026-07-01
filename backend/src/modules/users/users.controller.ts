import { Body, Controller, HttpCode, HttpStatus, Patch, Post } from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UsersService } from "./users.service";

@ApiTags("Users")
@ApiCookieAuth("access_token")
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @ApiOperation({ summary: "Update profile", description: "Updates the current user's name and/or email." })
  @ApiResponse({ status: 200, description: "Profile updated" })
  @ApiResponse({ status: 409, description: "Email already in use" })
  @Patch("me")
  async updateProfile(
    @CurrentUser("id") userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    const user = await this.users.updateProfile(userId, dto);
    return { message: "Profile updated", data: user };
  }

  @ApiOperation({ summary: "Change password", description: "Verifies the current password, then sets a new one." })
  @ApiResponse({ status: 200, description: "Password changed" })
  @ApiResponse({ status: 400, description: "Current password is incorrect" })
  @HttpCode(HttpStatus.OK)
  @Post("me/password")
  async changePassword(
    @CurrentUser("id") userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.users.changePassword(userId, dto.currentPassword, dto.newPassword);
    return { message: "Password changed", data: null };
  }
}
