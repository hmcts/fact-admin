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
    When I add new postcodes "bd7 2qb,bd3,BD7"
    Then I click the add postcode button
    Then A green message is displayed for the postcodes "Postcodes updated"
    When I will make sure to delete the existing postcodes
    Then A green message is displayed for the postcodes "Postcodes updated"
    And the court is cleaned up through the API

  Scenario: Adding invalid and duplicate postcode @special
    When I add new postcodes "bdx,123,bd1"
    Then I click the add postcode button
    Then The error message display for the postcodes "A problem has occurred (your changes have not been saved). The following postcodes are invalid: bdx,123"
    When I add new postcodes "bd1"
    Then I click the add postcode button
    When I add new postcodes "bd1"
    Then I click the add postcode button
    Then The error message display for the postcodes "One or more postcodes provided already exist (your changes have not been saved). If this is not the case please check that the court is not currently locked by another user: BD1"
    And the court is cleaned up through the API

    #THIS IS COMMENTED IN PREVIOUS TESTS SO COMMENTING IT HERE AS WELL (steps need to be converted)
#  Scenario Outline: Moving postcodes from the source court to the destination court
#    When I will make sure to delete the existing postcodes
#    When I add new postcodes "bd10,bd2,bd4"
#    Then I click the add postcode button
#    Then A green message is displayed for the postcodes "Postcodes updated"
#    Then I will make sure to delete the existing postcodes for the court "<view_court_slug>"
#    Then I go back to the editing postcodes for source court "county-court-money-claims-centre-ccmcc"
#    When I choose the postcodes "BD4" and "BD2" to move them from the source court to the destination court
#    Then I choose the destination court as "<view_court_slug>"
#    Then I click the move button
#    Then A green message is displayed for the postcodes "Postcodes updated"
#
#    Examples:
#      | view_court_slug             |
#      | county-court-business-centre-ccbc |
