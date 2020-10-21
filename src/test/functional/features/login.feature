Feature: Login/Logout

  Background:
    Given I am on FACT homepage
    Then I expect the page header to be "GOV.UK - The best place to find government services and information"
    Given that I am a logged-out admin or super admin user
    And I click the Login link

  Scenario Outline: Login Unsuccessful
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials "<username>" "<password>"
    And click the Sign In button
    Then an error message is shown

    Examples:
      | username              | password        |
      | wrong-email@gmail.com | wrongPa55word11 |


  Scenario Outline: Login Successful
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my authenticated credentials "<username>" "<password>"
    And click the Sign In button
    Then the system will sign me in

    Examples:
      | username             | password   |
      | hmcts.fact@gmail.com | Pa55word11 |

  Scenario: Logout
    Given that I am a logged-in admin or super admin user
    When I click the Logout link
    Then the system will log me out
