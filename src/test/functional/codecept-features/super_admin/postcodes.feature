Feature: Postcodes

  Background:
    Given a court is created through the API
    When I log in as a super-admin
    When I click edit next to the test court
    Then I am redirected to the Edit Court page for the chosen court

    And I hover over nav element
    And I click the types tab
    And I will make sure County court type is selected
    And I click on save court type

    And I hover over nav element
    And I click the cases heard tab
    And I will make sure Money claims is selected
    And I click on update on cases heard

    And I hover over nav element
    And I click the postcodes tab

  Scenario: Adding and deleting valid postcodes @special
#    When I add new postcodes "bd7 2qb,bd3,BD7"
    Then I click the add postcode button
    Then A green message is displayed for the postcodes "Postcodes updated"
#    When I will make sure to delete the existing postcodes
    Then A green message is displayed for the postcodes "Postcodes updated"
