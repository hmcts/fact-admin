Feature: Login/Logout

  Background:
    Given I am on new browser
    And I am on FACT homepage
    Then I am logged out if I am a super admin

  Scenario Outline: Login Unsuccessful

    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my incorrect authenticated credentials "<username>" "<password>"
    And click the Sign In button
    Then an error message is shown

    Examples:
      | username              | password        |
      | wrong-email@gmail.com | wrongPa55word11 |

  Scenario: Login Successful
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials
    And click the Sign In button
    Then the system will sign me in
