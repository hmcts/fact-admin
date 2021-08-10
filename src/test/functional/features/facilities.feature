Feature: Facilities

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I select Include closed courts
    Then I can view the courts or tribunals in a list format
    When I click edit next to court with "basingstoke-county-court-and-family-court"
    Then I am redirected to the Edit Court page for the chosen court
    When I hover over opening hours nav element
    And I click the facilities tab
    Then I can view the existing facilities


  Scenario: As a user I should be able to add and remove facilities successfully
    When I remove all existing facility entries and save
    Then a green message is displayed for updated facilities "Court Facilities updated"
    When I enter new facility by selecting at the index 3 and enter description in english "englishDescription" and welsh "welshDescription"
#    And I click on add new facility
#    And I enter new facility by selecting at the index 6 and enter description in english "englishDescription" and welsh "welshDescription"
    And I click save in the facilities tab
    Then a green message is displayed for updated facilities "Court Facilities updated"
#    And the facility entry in second last position has name "name" description in english and welsh description "welshDescription"
#   When the facility entry in last position has index 3 description in english and welsh description "welshDescription"
#    And I click the remove button under newly added facility entries
    And I click the remove button under newly added facility entries
    And I click save in the facilities tab
    And a green message is displayed for updated facilities "Court Facilities updated"
    And there are no facility entries

  Scenario: As a user I should not be allowed to add duplicate facilities
    When I remove all existing facility entries and save
    Then a green message is displayed for updated facilities "Court Facilities updated"
    When I enter new facility by selecting at the index 6 and enter description in english "englishDescription" and welsh "welshDescription"
    And I click save in the facilities tab
    Then a green message is displayed for updated facilities "Court Facilities updated"
    When I enter new facility by selecting at the index 6 and enter description in english "englishDescription" and welsh "welshDescription"
    And I click save in the facilities tab
    And An error is displayed for facilities with summary "All facilities must be unique." and description field message "Duplicated facility"
    And I remove all existing facility entries and save
    And a green message is displayed for updated facilities "Court Facilities updated"
    And there are no facility entries

  Scenario: Prevent blank entries being added
    When I remove all existing facility entries and save
    Then a green message is displayed for updated facilities "Court Facilities updated"
    When I enter new facility by selecting at the index 6 and enter description in english " " and welsh " "
    And I click save in the facilities tab
#    Then An error is displayed for facilities with summary "Name and description is required for all court facilities." and description field message "facility is mandatory"

