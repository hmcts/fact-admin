Feature: Logout

  Scenario: Admin user logout test
    When I log in as an admin
    When I click the Logout link
    Then the system will log me out

  Scenario: Super-admin user logout test
    When I log in as a super-admin
    When I click the Logout link
    Then the system will log me out

