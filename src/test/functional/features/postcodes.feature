Feature: Postcodes

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    Then I can view the courts or tribunals in a list format
    When I click edit next to court with "aberdare-magistrates-court"
    Then I am redirected to the Edit Court page for the chosen court
    When I click the postcodes tab

  Scenario: Adding and deleting valid postcodes
    Then I click the select all
    When I click the delete all selected button
    Then A green message is displayed for the postcodes "Postcodes updated"
    When I add new postcodes "bd7 2qb,bd2,bd4,BD7"
    Then I click the add postcode button
    Then A green message is displayed for the postcodes "Postcodes updated"

  Scenario: Adding invalid and duplicate postcode
    When I add new postcodes "bdx,123,bd1"
    Then I click the add postcode button
    Then The error message display for the postcodes "A problem has occurred (your changes have not been saved). The following postcodes are invalid: bdx,123"
    When I add new postcodes "bd7 2qb"
    Then I click the add postcode button
    Then The error message display for the postcodes "One or more postcodes provided already exist: BD72QB"

  Scenario Outline: Moving postcodes from the source court to the destination court
    When I choose the postcodes bd4 and bd2 to move them from the source court to the destination court
    Then I choose the destination court as "<view_court_slug>"
    Then I click the move button
    Then A green message is displayed for the postcodes "Postcodes updated"

    Examples:
      | view_court_slug            |
      | aldridge-magistrates-court |

